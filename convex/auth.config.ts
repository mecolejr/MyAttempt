import { convexAuth } from "@convex-dev/auth/server";
import { clerkAuthAdapter } from "@convex-dev/auth/server";

export default convexAuth({
  providers: [clerkAuthAdapter()],
});