import configJSON from './web3-config.json' assert { type: "json" };
import {ExpressBuilder, ExpressCorsConfigurer} from "@sphereon/ssi-express-support";
import {
    createRpcServer,
    createWeb3Provider,
    EthersHeadlessProvider,
    EthersKMSSignerBuilder,
    IWeb3Provider
} from "@sphereon/ssi-sdk-web3.headless-provider";
import {ManagedKeyInfo} from "@veramo/core";
import {Signer} from "ethers";
import agent, {context} from "./agent";

export function web3WalletsSetup() {
    if (configJSON && Array.isArray(configJSON.configs)) {
        const configs = configJSON as Configs
        for (const config of configs.configs) {
            const expressSupport = ExpressBuilder.fromServerOpts({
                hostname: config.hostname ?? '127.0.0.1',
                port: config.port ?? 2999,
                basePath: config.basePath ?? '/web3/rpc',
            })
                .withCorsConfigurer(new ExpressCorsConfigurer().allowOrigin('*'))
                .build()
            const wallets = config.wallets
            if (!wallets || wallets.length === 0) {
                throw Error('Cannot have an RPC provider without wallets. Adjust the config')
            }
            const result = wallets.map((wallet) => {
                const privateKeys = wallet.privateKeys
                if (!privateKeys || privateKeys.length === 0) {
                    throw Error('A wallet without private keys encountered when setting up the headless RPC web3 wallet. Adjust the config')
                }
                const importedKeys = privateKeys.map((privateKeyHex) =>
                    agent
                        .keyManagerImport({
                            privateKeyHex,
                            kms: 'local',
                            type: 'Secp256k1',
                        })
                        .then((key) => {
                            console.log(`Imported key ${JSON.stringify(key)}`)
                            return key
                        })
                        .catch((e) => console.log(e)),
                )

                return Promise.all(importedKeys)
                    .then((walletsKeys) => {
                        const kmsSigners = walletsKeys
                            .filter((key) => key !== undefined)
                            .map((key) =>
                                new EthersKMSSignerBuilder()
                                    .withContext(context)
                                    .withKeyRef(key as ManagedKeyInfo)
                                    .build(),
                            )
                        let signers: Signer[]
                        let web3Provider: IWeb3Provider

                            // Inject window.ethereum instance
                        ;[signers, web3Provider] = injectWeb3Provider({signers: kmsSigners})
                        const headlessProvider = web3Provider as EthersHeadlessProvider
                        console.log(`NO Wallets: ${JSON.stringify(signers.length)}`)

                        createRpcServer(headlessProvider, expressSupport, {
                            path: wallet.path ?? '',
                            basePath: config.basePath
                        })
                    })
                    .then((value) => wallet)
            })

            Promise.all(result).then((walletConfig) => {
                expressSupport.start()
                console.log('Done setting up ' + config.basePath)
            })
        }
    }
}

/**
 * injectWeb3Provider - Function to create and inject web3 provider instance into the global window object
 *
 * @returns {Array} An array containing the wallets and the web3Provider instance
 */
export function injectWeb3Provider(opts?: { signers?: Signer[] }): [Signer[], IWeb3Provider] {
    const wallets: Signer[] = []
    if (opts?.signers) {
        wallets.push(...opts.signers)
    }
    if (wallets.length === 0) {
        throw Error(`Not wallet/signer available to inject`)
    }

    // Create an instance of the Web3Provider
    let web3Provider: IWeb3Provider = createWeb3Provider(
        wallets,
        [100], // Chain ID - 31337 or  is a common testnet id
        // [1337], 'http://127.0.0.1:8545' // Ethereum client's JSON-RPC URL
        'https://rpc.genx.minimal-gaia-x.eu',
    )

    // Expose the web3Provider instance to the global window object
    if (typeof window !== 'undefined') {
        // @ts-ignore-error
        window.ethereum = web3Provider
    }

    // Return the created wallets and web3Provider instance
    return [wallets, web3Provider]
}

export interface Configs {
    configs: Config[]
}

export interface Config {
    basePath?: string
    hostname?: string
    port?: number
    wallets: WalletConfig[]
}

export interface WalletConfig {
    privateKeys: string[]
    path?: string
}
