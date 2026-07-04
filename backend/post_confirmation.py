import boto3


def handler(event, context):
    boto3.client("cognito-idp").admin_add_user_to_group(
        UserPoolId=event["userPoolId"],
        Username=event["userName"],
        GroupName="Users",
    )
    return event
