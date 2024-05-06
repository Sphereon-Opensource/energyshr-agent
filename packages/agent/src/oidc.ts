import passport from 'passport'

import { ClientMetadata, Strategy, UserinfoResponse } from 'openid-client'
import { env, ExpressBuilder, ExpressCorsConfigurer, oidcDiscoverIssuer, OpenIDConnectAuthApi } from '@sphereon/ssi-express-support'

const PREFIX = process.env.PREFIX ?? ''
const ENVIRONMENT = env('ENVIRONMENT', PREFIX) ?? 'dev'
const issuerUrl =
    env('OIDC_ISSUER', PREFIX) ??
    (ENVIRONMENT.toLocaleLowerCase() === 'energyshr' ? 'https://proxy.sram.surf.nl' : 'https://auth01.test.sphereon.com/auth/realms/energy-shr')
const STRATEGY = env('OIDC_STRATEGY_NAME', PREFIX) ?? 'oidc'

console.log(`Starting OIDC RP API for env '${ENVIRONMENT}/${process.env.NODE_ENV}', issuer: ${issuerUrl} with strategy ${STRATEGY}`)

export async function oidcBackendSetup() {
    const oidcIssuer = await oidcDiscoverIssuer({ issuerUrl })
    const devMetadata: ClientMetadata = {
        client_id: env('OIDC_CLIENT_ID', PREFIX) ?? 'EnergySHRDev',
        client_secret: env('OIDC_CLIENT_SECRET', PREFIX) ?? 'iZDmseeTIpuVFcodqc3cQpJ6gak7xMfa',
        redirect_uris: ['http://localhost:8000/authentication/callback'],
        post_logout_redirect_uris: ['http://localhost:8000/authentication/logout-callback'],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_basic',
    }

    const energyShrMetadata: ClientMetadata = {
        client_id: env('OIDC_CLIENT_ID', PREFIX) ?? '',
        client_secret: env('OIDC_CLIENT_SECRET', PREFIX) ?? '',
        redirect_uris: ['https://www.energyshr.nl/authentication/callback'],
        post_logout_redirect_uris: ['https://www.energyshr.nl/authentication/logout-callback'],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_basic',
    }
    const metadata: ClientMetadata = ENVIRONMENT.toLocaleLowerCase() === 'energyshr' ? energyShrMetadata : devMetadata
    if (!metadata.client_id || metadata.client_id.trim() === '') {
        throw Error('Please provide a valid client id')
    } else if (!metadata.client_secret || metadata.client_secret.trim() === '') {
        throw Error('Please provide a valid client secret')
    }

    const client = new oidcIssuer.issuer.Client(metadata)

    const secret = env('OIDC_SESSION_SECRET', PREFIX)
    if (!secret || secret.trim().length === 0) {
        console.warn('!!!!!!!!!!!!!!!!!!!')
        console.log('Using default secret, please change')
        console.warn('!!!!!!!!!!!!!!!!!!!')
    }
    const expressSupport = ExpressBuilder.fromServerOpts({
        port: env('PORT', PREFIX) ? new Number(env('PORT', PREFIX)).valueOf() : 3001,
        hostname: env('HOSTNAME', PREFIX) ?? 'localhost',
    })
        .withMorganLogging()
        .withCorsConfigurer(
            new ExpressCorsConfigurer().allowOrigin(env('OIDC_FRONTEND_CORS_ORIGIN', PREFIX) ?? 'http://localhost:3001').allowCredentials(true),
        )
        .withPassportAuth(true)
        .withSessionOptions({
            secret: secret ?? 'defaultSecretPleaseChange!',
            // proxy: true,
            resave: false,
            saveUninitialized: true
        })
        .build({ startListening: false })

    passport.use(
        STRATEGY,
        new Strategy(
            {
                client,
                passReqToCallback: true,
                params: {
                    scope: 'openid email',
                },
            },
            (req: any, tokenSet: any, userinfo: UserinfoResponse<any, any>, done: any) => {
                req.session.tokens = tokenSet
                const authInfo = {
                    ...userinfo,
                    ...tokenSet.claims(),
                }
                return done(null, authInfo)
            },
        ),
    )
    passport.serializeUser(function (user, done) {
        done(null, user)
    })
    passport.deserializeUser(function (user, done) {
        done(null, user!)
    })
    new OpenIDConnectAuthApi({
        expressSupport,
        client,
        opts: {
            endpointOpts: {
                globalAuth: {
                    authentication: {
                        enabled: true,
                        useDefaultCallback: true,
                        strategy: STRATEGY,
                    },
                },
            },
        },
    })

    expressSupport.start()
}
