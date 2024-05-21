# Config doc

These properties in details are as follows.

| Property                | Description                                                                               | Type                           | Default value                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------- |
| appName                 | Application name for stack                                                                | string                         | `dev`                                           |
| region                  | Deployment AWS resouces the to region                                                     | string                         | `us-east-1`                                     |
| adminEmail              | Send the temporary password to this email for signing graph application                   | string                         | `your_email@acme.com`                           |
| allowedIps              | AWS WAF allowed this ips to access to the graph application. e.g.) [`"192.0.3.0/24"`]     | string[]                       | `[]`                                            |
| wafParamName            | The name of Paramater store in AWS Systems Manager which stores the web acl id of AWS WAF | string                         | `graphAppWafWebACLID`                           |
| webBucketsRemovalPolicy | Removal policy for S3 buckets                                                             | `RemovalPolicy`                | `RemovalPolicy.DESTROY`                         |
| s3Uri                   | S3 URI of `vertex.csv` and `edge.csv` which you stored in.                                | { edge: string,vertex: string} | `{edge: "EDGE_S3_URI",vertex: "VERTEX_S3_URI"}` |
