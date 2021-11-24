/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 13:26:52
 * @LastEditTime: 2021-11-25 00:02:27
 */

const mysql = require('mysql');

const config = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'half_bug',
  database: 'whfang',
}

const connection = mysql.createConnection(config);
connection.connect();

exports.insertHouses = (houses) => {
  return new Promise((resolve, reject) => {
    try {
      const sql = 'insert into wh_house_2021(code, district, street, community, title, salePrice, unitPrice, details, link)'
      
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

exports.insertCommunities = communities => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO wh_community_2021(code, district, street, name, unitPrice, saleCount, buildYear, soldInfo, rentInfo, link)'

    let values = '';
    for (let community of communities) {
      const { code, district, street, name, unitPrice, count, buildYear, soldInfo, rentInfo, link } = community;
      values += `,("${code}", "${district}", "${street}", "${name}", "${unitPrice}", "${count}", "${buildYear}", "${soldInfo}", "${rentInfo}", "${link}")`
    }

    connection.query(`${sql} VALUES ${values.slice(1)}`, (err, res, fields) => {
      if (err) reject(err);
      resolve();
    })
  })
}

// 清空表格
exports.emptyTable = tableName => {
  return new Promise((resolve, reject) => {
    connection.query(`truncate ${tableName}`, (error, results, fields) => {
      if (error) throw error;
      console.log(`清空表 ${tableName} 中所有数据`);
      resolve();
    });
  })
}

const getItemsByStreet = (table, street_name) => {
  return new Promise((resolve, reject) => {
    connection.query(`select * from ${table} where street = "${street_name}"`, (err, data) => {
      if (err) reject(err);

      // console.log(data[0]);
      resolve(data);
    })
  })
}

exports.getCommunitiesByStreet = street_name => {
  return getItemsByStreet('wh_community_2021', street_name);
}

exports.getHousesByStreet = street_name => {
  return getItemsByStreet('wh_house_2021', street_name);
}

/**
 * @param {} table 表名
 * @param {*} id 需要更新的数据 id
 * @param {*} info 确保键名与数据库中的字段名一致
 */
const updateById = (table, id, info) => {
  return new Promise((resolve, reject) => {
    // 拼接 sql 语句
    let values = '';
    for (let [key, value] of Object.entries(info)) {
      values += `,${key} = "${value}"`
    }

    connection.query(`UPDATE ${table} SET ${values.slice(1)} WHERE id = ${id}`, (err, data) => {
      if (err) reject(err);
      resolve();
    })
  })
}

/**
 * 为小区增加信息
 * @param {*} community 给定的小区
 * @param {*} details 获取的详情信息
 * @returns 
 */
exports.updateDetailsForCommunity = (community, details) => {
  return updateById('wh_community_2021', community.id, details);
}

exports.updateDetailsForHouse = (house, details) => {
  return updateById('wh_house_2021', house.id, details);
}

// TEST
// exports.insertHouses(sample);
// exports.emptyTable('wh_2021');
// exports.getCommunitiesByStreet('百步亭');
