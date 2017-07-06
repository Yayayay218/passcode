/**
 * Created by yayayay on 06/07/2017.
 */
module.exports = {
    DEV_OPTS: {
        cert: "app_server/keys/dev/cert_dev.pem",
        key: "app_server/keys/dev/key_dev.pem",
        production: false,
    },

    PRD_OPTS: {
        cert: "app_server/keys/product/cert.pem",
        key: "app_server/keys/product/key.pem",
        production: false,
    }
};
