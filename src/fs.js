/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 21:02:12
 * @LastEditTime: 2021-11-24 12:36:54
 */

const fs = require('fs');
const path = require('path');

exports.readJson = filePath => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, filePath), 'utf-8', (err, data) => {
      if (err) reject(err);

      resolve(JSON.parse(data));
    })
  })
}

exports.writeJson = (filePath, jsonData) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, filePath), JSON.stringify(jsonData), 'utf-8', err => {
      if (err) reject();

      resolve();
    })
  })
}

/**
 * 覆盖写 json
 * @param {*} filePath 
 * @param {[]} itemData 
 * @returns 
 */
exports.appendArray = (filePath, itemData) => {
  return new Promise((resolve, reject) => {
    fs.access(path.join(__dirname, filePath), fs.constants.F_OK, async (err) => {
      let rowData = [];
      // 如果文件存在
      if (!err) {
        rowData = await exports.readJson(filePath);
      }

      await exports.writeJson(filePath, [...rowData, ...itemData]);
      resolve();
    })
  })
}

// TEST
(async () => {
  const obj = await exports.readJson('./streets.json');

  exports.writeJson('./streets.json', {
    ...obj,
    "zy": "赵玉春2"
  });
})
