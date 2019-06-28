const proxy = require('express-http-proxy');
const passport = require('passport');
const Client = require('kubernetes-client').Client;
const { KubeConfig } = require('kubernetes-client');
const Request = require('kubernetes-client/backends/request');

const namespace = process.env.namespace || 'default';

const isMultipartRequest = req => {
  let contentTypeHeader = req.headers['content-type'];
  return contentTypeHeader && contentTypeHeader.indexOf('multipart') > -1;
};

module.exports = async server => {
  try {
    const kubeconfig = new KubeConfig();
    kubeconfig.loadFromCluster();
    const backend = new Request({ kubeconfig });
    const client = new Client({ backend });

    await client.loadSpec();

    const services = await client.api.v1
      .namespaces(namespace)
      .services()
      .get();

    const {
      body: { items }
    } = services;

    await items.forEach(service => {
      const {
        metadata,
        spec: { ports }
      } = service;
      if (metadata.labels) {
        const {
          labels: { serviceName, serviceRoute }
        } = metadata;

        if (serviceName && serviceRoute) {
          const port = ports[0].port;

          server.use(
            `/${serviceRoute}`,
            (req, res, next) => {
              if (req.originalUrl === '/auth/admin/login') {
                next();
              } else {
                return passport.authenticate('jwt', { session: false })(
                  req,
                  res,
                  next
                );
              }
            },
            (req, res, next) => {
              return proxy(`http://${serviceName}:${port}${req.url}`, {
                parseReqBody: !isMultipartRequest(req),
                proxyReqPathResolver: req => {
                  return `https://${serviceName}:${port}${req.url}`;
                }
              })(req, res, next);
            }
          );
        }
      }
    });
  } catch (error) {
    console.error('Error from kube api', error);
  }
};
