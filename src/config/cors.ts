import {CorsOptions} from 'cors';

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    // console.log(process.argv, 'process.argv'); //* check the --api arg in the array =[2]
    const whiteList = [process.env.FRONTEND_URL];
    if (process.argv[2] === '--api') {
      //! run npm run dev:api in terminal
      //*config package.json scripts to run backend server
      whiteList.push(undefined);
    }

    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
