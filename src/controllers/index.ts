async function routes(app, opts, next) {
    app.get('/', async (req, res) => {
        res.status(200).send({ status: 'ok', message: 'donate' });
    });
}
module.exports = routes;