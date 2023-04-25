export const URL_HOST =
  process.env.NODE_ENV === "production"
    ? `https://amplify-eb-proxy.1joeknapp4809.workers.dev/http://backend-rvl-env.eba-ejsmgqie.us-east-1.elasticbeanstalk.com`
    : `http://127.0.0.1:8000`;
