import { authorizer } from "@middleware/AuthorizerFunction";
import { user } from "@user/controller/functions";

export default {
  ...user,
  ...authorizer
}