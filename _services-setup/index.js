const proxy = require('express-http-proxy');
// const kubernetes = require('kubernetes-client');
const passport = require('passport');
const Client = require('kubernetes-client').Client;
const { KubeConfig } = require('kubernetes-client');
const Request = require('kubernetes-client/backends/request');
const namespace = process.env.namespace || 'default';

const start = async () => {
  try {
    const kubeconfig = new KubeConfig();
    kubeconfig.loadFromCluster();
    const backend = new Request({ kubeconfig });
    const client = new Client({ backend });

    await client.loadSpec();

    //
    // Get all the Namespaces.
    //
    const availableNamespaces = await client.api.v1.namespaces.get();
    console.log('Namespaces: ', availableNamespaces);

    const services = await client.api.v1
      .namespaces(namespace)
      .services()
      .get();
    console.log('services: ', services);
  } catch (error) {
    console.log('Error from kube api', error);
  }
};

module.exports = () => {
  start();
};
// const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// const isMultipartRequest = req => {
//   let contentTypeHeader = req.headers['content-type'];
//   return contentTypeHeader && contentTypeHeader.indexOf('multipart') > -1;
// };

// module.exports = async server => {
//   return docker.listContainers(async (err, containers) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     await containers.forEach(container => {
//       const {
//         Labels: { serviceName, serviceRoute }
//       } = container;

//       if (serviceName && serviceRoute) {
//         server.use(
//           `/${serviceRoute}`,
//           (req, res, next) => {
//             if (req.originalUrl === '/auth/admin/login') {
//               next();
//             } else {
//               return passport.authenticate('jwt', { session: false })(
//                 req,
//                 res,
//                 next
//               );
//             }
//           },
//           (req, res, next) => {
//             return proxy(`http://${serviceName}:3000`, {
//               parseReqBody: !isMultipartRequest(req),
//               proxyReqPathResolver: req => {
//                 return `http://${serviceName}:3000${req.url}`;
//               }
//             })(req, res, next);
//           }
//         );
//       }
//     });
//   });
// };
