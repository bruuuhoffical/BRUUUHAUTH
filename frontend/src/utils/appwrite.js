import { Client, Account } from "https://cdn.jsdelivr.net/npm/appwrite@13.0.1/+esm";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("bruuuhauth");
const account = new Account(client);

export { client, account };
