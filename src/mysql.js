/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 13:26:52
 * @LastEditTime: 2021-11-23 22:36:55
 */

const mysql = require('mysql');

const config = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'half_bug',
  database: 'whfang',
}

const sample = [{
  code: '104107605718',
  link: 'https://wh.lianjia.com/ershoufang/104107605718.html',
  name: '现代城二区 ',
  desc: '丹水池地铁口 不临街 前后无遮挡 视野好',
  details: '4室2厅 | 126.45平米 | 南 北 | 精装 | 高楼层(共18层) | 2011年建 | 板塔结合',
  totalPrice: '280',
  unitPrice: '22144',
  district: '江岸',
  street: '百步亭',
}, {
  code: '104107605712',
  link: 'https://wh.lianjia.com/ershoufang/104107605718.html',
  name: '现代城二区 ',
  desc: '丹水池地铁口 不临街 前后无遮挡 视野好',
  details: '4室2厅 | 126.45平米 | 南 北 | 精装 | 高楼层(共18层) | 2011年建 | 板塔结合',
  totalPrice: '280',
  unitPrice: '22144',
  district: '江岸',
  street: '百步亭',
}]

const connection = mysql.createConnection(config);
connection.connect();


exports.insertHouses = (houses) => {
  return new Promise((resolve, reject) => {
    try {
      const sql = 'insert into wh_2021(code, district, street, community, title, salePrice, unitPrice, details, link)'
      
      let values = '';
      for (const house of houses) {
        values += `,("${house.code}","${house.district}","${house.street}","${house.name}", "${house.desc}",  "${house.totalPrice}","${house.unitPrice}", "${house.details}", "${house.link}")`
      }

      connection.query(`${sql} values ${values.slice(1)}`, (error, results, fields) => {
        if (error) throw error;

        resolve();
      });
      
      // connection.end();
    } catch (err) {
      reject();
    }
  })
}

exports.insertCommunities = commnunities => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO wh_community_2021(code, district, street, name, unitPrice, count, buildYear, soldInfo, rentInfo, link)'

    let values = '';
    for (let community of commnunities) {
      const { code, district, street, name, unitPrice, count, buildYear, soldInfo, rentInfo, link } = community;
      values += `,("${code}", "${district}", "${street}", "${name}", "${unitPrice}", "${count}", "${buildYear}", "${soldInfo}", "${rentInfo}", "${link}")`
    }

    connection.query(`${sql} VALUES ${values.slice(1)}`, (err, res, fields) => {
      if (err) reject(err);
      resolve();
    })
  })
}

exports.emptyTable = tableName => {
  return new Promise((resolve, reject) => {
    try {
      const connection = mysql.createConnection(config);
      connection.connect()

      const sql = `truncate ${tableName}`;
      
      connection.query(sql, (error, results, fields) => {
        if (error) throw error;

        console.log(`清空表 ${tableName} 中所有数据`);
      });

      connection.end();
      resolve();
    } catch (err) {
      reject();
    }
  })
}

// TEST
// exports.insertHouses(sample);
// exports.emptyTable('wh_2021');
