## Braze Transaction Emails

This program is a proof of concept for a declarative tool to prepare and send emails from Braze,
dynamically populating the api trigger properties with data from Hygraph, or our GraphQL services.

### Input
This program consumes YAML files formatted in a specific way. Each YAML file should include four sections.
The first is `Query`. In this section, the fields you want to retrieve from the GraphQL API are specified
with the same nested structure the data has in the GraphQL schema.
```yaml
Query:
  - destination:
      - destinationId
      - name
      - locationGroup:
          - name
      - residences:
          - residenceId
          - name
```

The second section is `inputs`. This section specifies the inputs for labels in the `Query` section. For the above
`Query` section, the inputs might look like this. These key-value pairs are used in constructing the GraphQL query that
is sent to Hygraph or a service.
```yaml
inputs:
  - Query:
      - $residenceWhere: ResidenceWhereInput
      - $destinationWhere: DestinationWhereUniqueInput!
  - destination:
    - where: $destinationWhere
  - residences:
    - where: $residenceWhere
```

The third section is `triggerProperties`. This section contains information required to unwrap the API response into a
JSON structure to be sent to the Braze Campaign trigger API endpoint. Each key-value pair follows this format:
```yaml
    - triggerPropertyName: pathToValueInGraphQLResponse
```
For the example configuration we are building, this section looks like this:
```yaml
triggerProperties:
  - destinationId: data.destination.destinationId
  - destinationName: data.destination.name
  - destinationLocationGroup: data.destination.locationGroup.name
  - residenceName: data.destination.residences.0.name
  - residenceId: data.destination.residences.0.residenceId
```

Finally, the last section is the Braze campaign ID for the email this config file corresponds to:
```yaml
campaignId: 'braze-campaign-id'
```

### Method of operation
The program operates by first parsing the YAML file into an object. Each top level node in the yaml is separated out
and parsed individually. The `inputs` and `Query` nodes are used to dynamically construct a GraphQL query.
Constructing the variables is currently mocked in this implementation, but it will require parsing the request that
initiates this code. 

Next, the program uses the constructed query and variables to fetch data to be used in the API trigger properties from
Hygraph. This could easily be swapped out for querying our supergraph if data outside what is in Hygraph is required.

Finally, the Braze Campaign trigger API request is built and sent to Braze.

### Use case
This code could be incorporated into a Lambda function or other deployed service that is triggered by a step function
or some other means. For the example of a trip confirmation email, the incoming request would need to include the trip
ID and the email of the recipient, and some identifier for the configuration file that needs to be processed for this
email. With the trip ID, all necessary information could be fetched from the supergraph and sent to Braze.
The configuration files would live in an S3 bucket, with names that uniquely identify each file, and line up with the
identifiers that are sent in the request that triggers the Lambda. Adding new emails would primarily involve
adding new configuration files to the S3 bucket, as well as updating the method of triggering the process to include
the new identifier.

### Problems to be solved
There are two open questions for this method: What will trigger it, and how to set the variables for the query.
