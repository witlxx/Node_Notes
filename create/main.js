"use strict";

const request = require("request");
const format = require("string-format");
format.extend(String.prototype);

let corpData = {
  corpId: "ding2c85cfb7caf79d9335c2f4657eb6378f",
  appKey: "dingtxawqpuu9tsvrbss",
  keySecret: "D6FARKfCiac9ohDZS7ifgihecECUJhZkBJVYtZMIwGM1dxfGJjCiHduZ-wYhaAm1",
  appId: "dingoatq8edxd7vegbcv5z",
  agentId: "test",
  appSecret: "2rOFS2KwYVexvaQ1nb2Mc_tY2J2tPEFnl1OlESc8nTesJmPRw_doY0IRQVCThGIG",
  corpCode: "qianxuntest"
};

const getTokenPath = "/gettoken?appkey={appKey}&appsecret={keySecret}";
const getDepartmentListPath =
  "/department/list?access_token={accessToken}&fetch_child=true";
const postDepartmentPath = "/department/create?access_token={accessToken}";
const postUserPath = "/user/create?access_token={accessToken}";

/**
 * request
 */
function requestHttp(path, method, jsonBody, headers) {
  return new Promise((resolve, reject) => {
    let oapiHost = "oapi.dingtalk.com";
    let url = `https://${oapiHost}/${path}`;
    let requestJson = {
      url: url,
      method: method,
      json: true
    };
    if (headers) {
      requestJson.headers = headers;
    }
    if ((method === "POST" || method === "post") && jsonBody) {
      requestJson.body = jsonBody;
    }
    request(requestJson, function(err, res, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * get token
 */
async function getToken() {
  const path = getTokenPath.format({
    appKey: corpData.appKey,
    keySecret: corpData.keySecret
  });
  const data = await requestHttp(path, "GET");
  return data.errcode === 0 ? data.access_token : false;
}

let accessToken; //赋值起点在getDepartmentList()
/**
 * get departments
 */
async function getDepartmentList() {
  const token = await getToken();
  if (!token) return false;
  accessToken = token;
  const path = getDepartmentListPath.format({
    accessToken: accessToken
  });
  const data = await requestHttp(path, "GET");
  return data.errcode === 0 ? data.department : [];
}

/**
 * post departments
 */
async function postDepartments() {
  let promises = [];
  const departmentList = await getDepartmentList();
  if (departmentList.length === 0) return false;
  const departCodes = departmentList.map(depart => depart.id);
  const path = postDepartmentPath.format({
    accessToken: accessToken
  });
  departCodes.forEach(departCode => {
    if (departCode !== "1") {
      promises.push(
        requestHttp(path, "POST", {
          access_token: accessToken,
          name: Math.random()
            .toString(36)
            .slice(-7),
          parentid: departCode
        })
      );
    }
  });
  const data = await Promise.all(promises);
  console.log("添加部门情况如下:");
  console.log(data);
  return true;
}

/**
 * post users 
 */
async function postUsers() {
  let promises = [];
  const departmentList = await getDepartmentList();
  if (departmentList.length === 0) return false;
  const path = postUserPath.format({
    accessToken: accessToken
  });
  const departCodes = departmentList.map(depart => depart.id);
  departCodes.forEach(departCode => {
    promises.push(
      requestHttp(path, "POST", {
        access_token: accessToken,
        name: Math.random()
          .toString(36)
          .slice(-5),
        department: [departCode, 1],
        mobile: "18621341111",
      })
    );
  });
  const data = await Promise.all(promises);
  console.log("添加员工部门情况如下:");
  console.log(data);
  return true;
}


async function main() {
  await postDepartments();
  await postUsers();
};
main();