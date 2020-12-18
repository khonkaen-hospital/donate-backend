
import Knex from "knex";

export class DashboardModel {

    public perPage: number = 25;

    async findCash(db: Knex, data: any) {
        let _page = (data.page - 1);
        let page = (data.page == 0) ? (_page * 1) : (_page * this.perPage);
        let search = data.search;
        let where = `where dca.category_id = '1' `;
        let order = `order by d.donatedate desc limit ${page}, ${this.perPage}`;
        if (search != '') {
            where += `and (
                (d.name like '%${search}%' or d.surname like '%${search}%') or companyname like '%${search}%' 
                or df.foundation_name like '${search}%' or dnod.name like '${search}%')`;

            if (search == 'ไม่มีวัตถุประสงค์') {
                where += ` or dc.typeaccount = 2 `;
            }

        }
        let sqlcount = `
            select count(d.id) as total, sum(dc.amount) as totalamount from donate d
            inner join donate_category dca on d.category_id = dca.category_id
            inner join donate_cash dc on d.id = dc.donate_id
            left join donate_foundation df on dc.foundation_id = df.foundation_id
            left join donate_objective dno on dc.objective_id = dno.objective_id
            left join donate_objectivedetail dnod on dc.objectivedetail_id = dnod.objectivedetail_id
            ${where}`;
        let sql = `
            select d.id, d.typename,
            CASE WHEN d.typename = 1 THEN "บุคคลธรรมดา" WHEN d.typename = 2 THEN "นิติบุคคล/บริษัท" WHEN d.typename = 3 THEN "ผู้ไม่ประสงค์จะออกนาม" WHEN d.typename = 4 THEN "เงินเหลือจ่าย" END as typeperson,
            CASE WHEN d.typename = 1 THEN CONCAT(d.name," ",d.surname) 	WHEN d.typename = 2 THEN companyname WHEN d.typename = 3 THEN "ผู้ไม่ประสงค์จะออกนาม" WHEN d.typename = 4 THEN "เงินเหลือจ่าย" END as donatename,
            CASE WHEN dc.typeaccount = 1 THEN "มีวัตถุประสงค์ " WHEN dc.typeaccount = 2 THEN "ไม่มีวัตถุประสงค์" END as typeaccount_name,
            dca.category_name,
            df.foundation_name,
            dno.name as objective_name,
            dnod.name as objectivedetail_name,
            dc.amount,
            d.donatedate
            from donate d
            inner join donate_category dca on d.category_id = dca.category_id
            inner join donate_cash dc on d.id = dc.donate_id
            left join donate_foundation df on dc.foundation_id = df.foundation_id
            left join donate_objective dno on dc.objective_id = dno.objective_id
            left join donate_objectivedetail dnod on dc.objectivedetail_id = dnod.objectivedetail_id
            ${where} ${order}
        `;
        let result = await db.raw(sql);
        let allitems = await db.raw(sqlcount);
        let total = Math.ceil(parseInt(allitems[0][0]['total']) / this.perPage);
        return [result[0], data.page, total, allitems[0][0]['total'], allitems[0][0]['totalamount']]
    }

    async findChattel(db: Knex, data: any) {
        let _page = (data.page - 1);
        let page = (data.page == 0) ? (_page * 1) : (_page * this.perPage);
        let search = data.search;
        let where = `where dca.category_id = '3' `;
        let order = `order by d.donatedate desc limit ${page}, ${this.perPage}`;
        if (search != '') {
            where += `and d.name like '%${search}%' or d.surname like '%${search}%' or companyname like '%${search}%'
            or dc.detail like '%${search}%' or dca.category_name like '%${search}%' `;
        }
        let sqlcount = `
            select count(d.id) as total, sum(dc.amount) as totalamount from donate d
            left join donate_category dca on d.category_id = dca.category_id
            left join donate_chattels dc on d.id = dc.donate_id
            ${where}`;
        let sql = `
        select d.id, d.typename,
        CASE WHEN d.typename = 1 THEN "บุคคลธรรมดา" WHEN d.typename = 2 THEN "นิติบุคคล/บริษัท" WHEN d.typename = 3 THEN "ผู้ไม่ประสงค์จะออกนาม" WHEN d.typename = 4 THEN "เงินเหลือจ่าย" END as typeperson,
        CASE WHEN d.typename = 1 THEN CONCAT(d.name," ",d.surname) 	WHEN d.typename = 2 THEN companyname WHEN d.typename = 3 THEN "ผู้ไม่ประสงค์จะออกนาม" WHEN d.typename = 4 THEN "เงินเหลือจ่าย" END as donatename,
        dca.category_name,
        dc.detail,
        dc.amount,
        d.donatedate
        from donate d
        left join donate_category dca on d.category_id = dca.category_id
        left join donate_chattels dc on d.id = dc.donate_id
        ${where} ${order}`;
        let result = await db.raw(sql);
        let allitems = await db.raw(sqlcount);
        let total = Math.ceil(parseInt(allitems[0][0]['total']) / this.perPage);
        return [result[0], data.page, total, allitems[0][0]['total'], allitems[0][0]['totalamount']]
    }

    async findCashFilter(db: Knex, data: any) {
        let month = data.month;
        let foundation = data.foundation;
        let objective = data.objective;
        let sql = `select 
        d.foundation_name, CONCAT(e.objective_id,' ',f.objectivedetail_id) obj_id, e.objective_id, e.name as objective_name, 
        f.objectivedetail_id, f.name as objectivedetail_name, sum(a.amount) sum_amount from donate_cash a 
        inner join donate b on a.donate_id = b.id
        inner join donate_cashtype c on a.cashtype_id = c.cashtype_id
        inner join donate_foundation d on a.foundation_id = d.foundation_id
        left join donate_objective e on a.objective_id = e.objective_id
        left join donate_objectivedetail f on a.objectivedetail_id = f.objectivedetail_id
        where a.donate_id is not null `;
        if (month != '' && month != undefined && month != 'ทั้งหมด') {
            sql += `and DATE_FORMAT(b.donatedate, "%Y-%m") = '${month}' `;
        }
        if (foundation != undefined && foundation != '') {
            sql += `and a.foundation_id = '${foundation}' `;
        }
        if (objective != undefined && objective != '') {
            sql += `and a.objective_id = '${objective}' `;
        }
        sql += ` group by d.foundation_id, e.objective_id, f.objectivedetail_id;`;
        return await db.raw(sql);
    }

    async getMonthDonate(db: Knex, id: number) {
        let sql = `select 
        DATE_FORMAT(donatedate, "%Y-%m") as groupsdate 
        from donate a
        inner join donate_cash b on a.id = b.donate_id
        where b.objective_id = '${id}'
        GROUP BY DATE_FORMAT(donatedate, "%Y-%m")
        ORDER BY groupsdate desc;`;
        return await db.raw(sql);
    }

    async findCashNameFilter(db: Knex, data: any) {
        let object = data.object;
        let month = data.month;
        let search = data.search;
        let word = data.search.split(' ');
        let sql = `select d.id, CASE WHEN d.typename = 1 THEN "บุคคลธรรมดา" WHEN d.typename = 2 THEN "นิติบุคคล/บริษัท" 
            WHEN d.typename = 3 THEN "ผู้ไม่ประสงค์จะออกนาม" WHEN d.typename = 4 THEN "เงินเหลือจ่าย" END as typeperson,
            CASE WHEN d.typename = 1 THEN CONCAT(d.title,"",d.name," ",d.surname) 
            WHEN d.typename = 2 THEN companyname WHEN d.typename = 3 THEN "ผู้ไม่ประสงค์จะออกนาม" WHEN d.typename = 4 
            THEN "เงินเหลือจ่าย" END as donatename,
            dca.category_name, df.foundation_name, dno.name as objective_name, dnod.name as objectivedetail_name,
            dc.amount, d.donatedate, d.gratefulno from donate d
            inner join donate_category dca on d.category_id = dca.category_id
            left join donate_cash dc on d.id = dc.donate_id
            left join donate_foundation df on dc.foundation_id = df.foundation_id
            left join donate_objective dno on dc.objective_id = dno.objective_id
            left join donate_objectivedetail dnod on dc.objectivedetail_id = dnod.objectivedetail_id
            where (dca.category_id = '1' and dc.objective_id = '${object}') `;
        if (month != '' && month != undefined) {
            sql += ` and DATE_FORMAT(d.donatedate, "%Y-%m") = '${month}' `;
        }
        if (word.length == 2) {
            sql += ` and (d.name like '%${word[0].trim()}%' and d.surname like '%${word[1].trim()}%') `;
        } else if (search != '' && search != undefined) {
            sql += ` and d.name like '%${search.trim()}%' or d.surname like '%${search.trim()}%' or (d.companyname like '') `;
        }
        sql += ` order by d.donatedate asc;`;
        return await db.raw(sql);
    }
}