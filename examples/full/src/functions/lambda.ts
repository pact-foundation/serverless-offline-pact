import serverless from 'serverless-http'
import koa from "koa";
import pino from "pino";
import axios, { AxiosError } from "axios";

export const Router = new koa();

Router.use(async (ctx) => {

  const dest = pino.destination({ sync: false });
  const logger = pino(dest).child({
  });
  try {

      const result = await axios
      .get(`http://localhost:9000${ctx.request.url}`, {})
      .then();

      logger.info({ result: result.data }, "Pact Stub Service Response");

      ctx.body = result.data

  } catch (error) {
    if (error && error.isAxiosError) {
      const axiosError = error as AxiosError;

      if (error.response) {
        logger.error(
          {
            error: axiosError.response.data,
          },
          "Axios error occurred"
        );
        throw axiosError.response.data;
      }

      logger.error(
        {
          error: axiosError.message,
        },
        "Axios error occurred"
      );
      throw axiosError.message;
    }


    const errorMessageGeneric = "Generic error occurred";

    logger.error(
      {
        error: error.toString(),
      },
      errorMessageGeneric
    );
    throw new Error(error.toString());
  } finally {
    dest.flushSync();
  }

});





export const run = serverless(Router)
