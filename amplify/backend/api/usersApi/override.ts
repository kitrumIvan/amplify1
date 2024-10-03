// This file is used to override the REST API resources configuration
import {AmplifyApiRestResourceStackTemplate, AmplifyProjectInfo} from '@aws-amplify/cli-extensibility-helper';


// https://docs.amplify.aws/gen1/javascript/build-a-backend/restapi/override-api-gateway/

export function override(resources: AmplifyApiRestResourceStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
    const authResourceName = "amplifytutroial240a6b77240a6b77";
    const userPoolArnParameter = "AuthCognitoUserPoolArn";

    resources.addCfnParameter({
            type: "String",
            description: "The ARN of an existing Cognito User Pool to authorize requests",
            default: "NONE",
        },
        userPoolArnParameter,
        {"Fn::GetAtt": [`auth${authResourceName}`, "Outputs.UserPoolArn"],}
    );

    resources.restApi.addPropertyOverride("Body.securityDefinitions", {
        Cognito: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            "x-amazon-apigateway-authtype": "cognito_user_pools",
            "x-amazon-apigateway-authorizer": {
                type: "cognito_user_pools",
                providerARNs: [
                    {
                        'Fn::Join': ['', [{Ref: userPoolArnParameter}]],
                    },
                ],
            },
        },
    });

    for (const path in resources.restApi.body.paths) {
        resources.restApi.addPropertyOverride(
            `Body.paths.${path}.x-amazon-apigateway-any-method.parameters`,
            [
                ...resources.restApi.body.paths[path]["x-amazon-apigateway-any-method"]
                    .parameters,
                {
                    name: "Authorization",
                    in: "header",
                    required: false,
                    type: "string",
                },
            ]
        );

        resources.restApi.addPropertyOverride(
            `Body.paths.${path}.x-amazon-apigateway-any-method.security`,
            [{Cognito: [],},]
        );
    }
}
