import { DashboardModel } from '../models/dashboard';
const dashboard = new DashboardModel();

async function routes(app, opts, next) {
    app.post('/cash', async (req, res) => {
        const data = req.body.data;
        let results = await dashboard.findCash(app.knex, data);
        res.status(200).send({ status: 'ok', rows: results[0], page: results[1], totalpage: results[2], all: results[3], totalamount: results[4] });
    });

    app.post('/chattel', async (req, res) => {
        const data = req.body.data;
        let results = await dashboard.findChattel(app.knex, data);
        res.status(200).send({ status: 'ok', rows: results[0], page: results[1], totalpage: results[2], all: results[3], totalamount: results[4] });
    });

    app.get('/cash-month/:id', async (req, res) => {
        let id = req.params.id;
        let results = await dashboard.getMonthDonate(app.knex, id);
        res.status(200).send({ status: 'ok', rows: results[0] });
    });

    app.post('/cash-filter', async (req, res) => {
        const data = req.body.data;
        let results = await dashboard.findCashFilter(app.knex, data);
        res.status(200).send({ status: 'ok', rows: results[0] });
    })

    app.post('/cash-name-filter', async (req, res) => {
        const data = req.body.data;
        let results = await dashboard.findCashNameFilter(app.knex, data);
        res.status(200).send({ status: 'ok', rows: results[0] });
    })
}
module.exports = routes;