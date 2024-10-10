import { AppProps } from 'next/app';
import Layout from 'pages/layout';

import '/src/styles/globals.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default MyApp;
