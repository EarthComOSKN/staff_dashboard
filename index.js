var express = require("express");
var app = express();
var db = require("./db");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var cors = require("cors");
var moment = require("moment");

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

const staffQuery = date => {
  const ans = `select * from dashboard.staff where DATEPART(mm,theDate)=${date.getUTCMonth() +
    1} and DATEPART(yy,theDate)=${date.getUTCFullYear()} and DATEPART(dd,theDate)=${date.getUTCDate()};`;
  console.log(ans);
  return ans;
};

app.get("/getStaff", function(req, res) {
  const request = db.request();
  request.query(staffQuery(new Date()), function(err, result) {
    // if (err) return next(err);

    var staffData = result.recordset;
    // console.log(data);
    // const overallData = overall(data);
    // // console.log(realTimeData);
    // res.send(realTimeData);
    res.send(staffData);
  });
});

app.post("/setStaff", function(req, res) {
  console.log(req.body);
  const {
    theDate,
    full_pick,
    full_decoct,
    full_dis,
    part_pick,
    part_decoct
  } = req.body;
  const request = db.request();
  const date = new Date(theDate);
  console.log(date);
  request.query(staffQuery(date), function(err, result) {
    console.log(result);
    if (result.recordset.length === 0) {
      const addStaffData = `INSERT INTO staff VALUES ('${moment(date).format(
        "YYYY-MM-DD HH:mm:ss"
      )}',${full_pick},${full_decoct},${full_dis},${part_pick},${part_decoct});`;
      console.log(addStaffData);
      request.query(addStaffData, function(err, result) {
        // if (err) return next(err);

        // var staffData = result.recordset;
        // console.log(result);
        // console.log(data);
        // const overallData = overall(data);
        // // console.log(realTimeData);
        // res.send(realTimeData);
        console.log("add", result);
        res.send({ result });
      });
    } else {
      const updateStaffData = `UPDATE staff SET full_pick=${full_pick}, full_decoct=${full_decoct} , full_dis=${full_dis}  , part_pick=${part_pick},part_decoct=${part_decoct} where DATEPART(mm,theDate)=${date.getUTCMonth() +
        1} and DATEPART(yy,theDate)=${date.getUTCFullYear()} and DATEPART(dd,theDate)=${date.getUTCDate()};`;
      request.query(updateStaffData, function(err, result) {
        // if (err) return next(err);
        console.log("update");
        // var staffData = result.recordset;
        // console.log(data);
        // const overallData = overall(data);
        // // console.log(realTimeData);
        // res.send(realTimeData);
        res.send({ result });
      });
    }
  });
});
const mockData = {
  theDate: null,
  full_pick: 0,
  full_decoct: 0,
  full_dis: 0,
  part_decoct: 0,
  part_pick: 0
};

const monthQuery = date => {
  return `select * from dashboard.staff WHERE DATEPART(mm,theDate)=${date.getUTCMonth() +
    1} and DATEPART(yy,theDate)=${date.getUTCFullYear()} Order by theDate  ASC;`;
};

const monthData = data => {
  const staffDict = {};
  for (let i = 0; i < 24; i++)
    staffDict[i] = JSON.parse(JSON.stringify(mockData));
  data.forEach(staff => {
    const date = new Date(staff.theDate);
    const h = date.getUTCHours();
    staffDict[h] = staff;
  });
  return staffDict;
};

app.post("/getStaffByMonth", function(req, res) {
  const request = db.request();
  const date = new Date(req.body.date);
  request.query(monthQuery(date), function(err, result) {
    // if (err) return next(err);

    var staffData = result.recordset;
    const monthlyData = monthData(staffData);
    // console.log(data);
    // const overallData = overall(data);
    // // console.log(realTimeData);
    // res.send(realTimeData);
    res.send(monthlyData);
  });
});

const threeMonthQuery = date => {
  const m1 = moment(date).toDate();
  const m2 = moment(date)
    .subtract(1, "month")
    .toDate();
  const m3 = moment(date)
    .subtract(2, "month")
    .toDate();
  // console.log(m1.toDate(),m2.toDate(),m3.toDate());
  return `select * from dashboard.staff
  WHERE DATEPART(mm,theDate)=${m1.getMonth() +
    1} and DATEPART(yy,theDate)=${m1.getUTCFullYear()} or DATEPART(mm,theDate)=${m2.getMonth() +
    1} and DATEPART(yy,theDate)=${m2.getUTCFullYear()} or DATEPART(mm,theDate)=${m3.getMonth() +
    1} and DATEPART(yy,theDate)=${m3.getUTCFullYear()} Order by theDate  ASC;`;
};

dayDict = {
  0: { ...mockData },
  1: { ...mockData },
  2: { ...mockData },
  3: { ...mockData },
  4: { ...mockData },
  5: { ...mockData },
  6: { ...mockData }
};

const threeMonthData = (data, date) => {
  const m1 = moment(date).toDate();
  const m2 = moment(date)
    .subtract(1, "month")
    .toDate();
  const m3 = moment(date)
    .subtract(2, "month")
    .toDate();
  const k1 = `${m1.getUTCMonth()}_${m1.getUTCFullYear()}`;
  const k2 = `${m2.getUTCMonth()}_${m2.getUTCFullYear()}`;
  const k3 = `${m3.getUTCMonth()}_${m3.getUTCFullYear()}`;
  const staffDict = {};
  staffDict[k1] = JSON.parse(JSON.stringify(dayDict));
  staffDict[k2] = JSON.parse(JSON.stringify(dayDict));
  staffDict[k3] = JSON.parse(JSON.stringify(dayDict));
  data.forEach(staff => {
    const date = new Date(staff.theDate);
    const m = date.getUTCMonth();
    const y = date.getUTCFullYear();
    const d = date.getUTCDay();
    staffDict[`${m}_${y}`][d].full_pick += staff.full_pick 
    staffDict[`${m}_${y}`][d].full_decoct += staff.full_decoct 
    staffDict[`${m}_${y}`][d].full_dis += staff.full_dis 
    staffDict[`${m}_${y}`][d].part_pick += staff.part_pick 
    staffDict[`${m}_${y}`][d].part_decoct += staff.part_decoct 
  });
  return staffDict;
};

app.post("/getStaffByThreeMonth", function(req, res) {
  const request = db.request();
  const date = new Date(req.body.date);
  request.query(threeMonthQuery(date), function(err, result) {
    // if (err) return next(err);

    var staffData = result.recordset;
    const monthlyData = threeMonthData(staffData, date);
    // console.log(data);
    // const overallData = overall(data);
    // // console.log(realTimeData);
    // res.send(realTimeData);
    res.send(monthlyData);
  });
});

var server = app.listen(5001, function() {
  console.log("Server is running..");
});

// select CONVERT(varchar(11),ps_time),CONVERT(varchar(11),getdate()) from dbo.psrel P INNER JOIN dbo.oprel O ON P.pre_id = O.pre_id and P.s_id = O.s_id INNER JOIN dbo.operator OP ON O.o_id = OP.o_id WHERE CONVERT(varchar(11),ps_time)=CONVERT(varchar(11),getdate()) Order by ps_time DESC ;
// select P.pre_id,P.s_id,P.ps_time,P.duration,P.numberOfOper,O.op_time,O.o_id,OP.o_type,OP.parttime from dbo.psrel P INNER JOIN dbo.oprel O ON P.pre_id = O.pre_id and P.s_id = O.s_id INNER JOIN dbo.operator OP ON O.o_id = OP.o_id WHERE CONVERT(varchar(11),ps_time)=CONVERT(varchar(11),getdate()) Order by ps_time DESC ;
// select top 5000 CONVERT(varchar(11),ps_time),CONVERT(varchar(3),'MAR 10 2019'),P.pre_id,P.s_id,P.ps_time,P.duration,P.numberOfOper,O.op_time,O.o_id,OP.o_type,OP.parttime from dbo.psrel P LEFT JOIN dbo.oprel O ON P.pre_id = O.pre_id and P.s_id = O.s_id LEFT JOIN dbo.operator OP ON O.o_id = OP.o_id WHERE CONVERT(varchar(3),ps_time)=CONVERT(varchar(3),'Mar 10 2019') Order by ps_time  DESC;
