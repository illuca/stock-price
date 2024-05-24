import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { DatePicker, Input, Button, message } from "antd";
import "./Stock.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StockChart() {
  const defaultCharData = {
    labels: [],
    datasets: [
      {
        label: "Closing Price",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  };
  const { RangePicker } = DatePicker;
  const [ticker, setTicker] = useState("000001");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState(defaultCharData);

  const formatChartData = (data) => {
    if (!data) {
      return {};
    }
    console.log(data);
    return {
      labels: data.map((d) => d?.timetag),
      datasets: [
        {
          label: "Close Price",
          data: data.map((d) => {
            return { x: d.timetag, y: d.close, changePercent: d.changePercent };
          }),
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };

  function checkValid() {
    if (!ticker) {
      message.error("股票编号不能为空");
      return false;
    }
    if (!startDate || !endDate) {
      message.error("日期范围不能为空");
      return false;
    }
    if (startDate.isAfter(endDate)) {
      message.error("开始日期不能晚于结束日期");
      return false;
    }
    return true;
  }

  async function fetchCloseData() {
    if (!checkValid()) {
      return;
    }
    axios
      .get("http://localhost:3005/stocks", {
        params: {
          ticker,
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        },
      })
      .then(({ data }) => {
        function doCalChangePercent(prev, curr) {
          if (prev.close === 0) {
            return (curr.close - prev.close) / 0.0001;
          } else {
            return (curr.close - prev.close) / prev.close;
          }
        }
        function calChangePercent(arr) {
          return arr.map((v, i) => {
            if (i === 0) {
              return { ...v, changePercent: 0 };
            } else {
              return {
                ...v,
                changePercent: doCalChangePercent(arr[i - 1], arr[i]),
              };
            }
          });
        }
        function cleanData(arr) {
          if (!arr) return [];
          let R = [arr[0]];
          let [prev, curr] = [undefined, undefined];
          for (let i = 1; i < arr.length; i++) {
            curr = arr[i].changePercent;
            if (
              prev !== undefined &&
              curr * prev >= 0 &&
              Math.abs(prev) < 0.1
            ) {
              R.pop();
            }
            R.push(arr[i]);
            prev = R[R.length - 1].changePercent = doCalChangePercent(
              R[R.length - 2],
              R[R.length - 1]
            );
          }
          return R;
        }
        message.success(`成功获取 ${data.length} 条数据`);
        if (data && data.length > 0) {
          data = calChangePercent(data);
          let cleaned = cleanData(data);
          let formatted = formatChartData(cleaned);
          setChartData(formatted);
        } else {
          setChartData(defaultCharData);
        }
      })
      .catch((err) => {
        message.error("数据获取失败，请重试");
      });
  }

  useEffect(() => {
    // fetchCloseData();
  }, []);

  return (
    <div className="stock-container">
      <div className="stock-info">
        <span>股票编号:</span>
        <Input
          value={ticker}
          onChange={(e) => {
            setTicker(e.target.value);
          }}
          style={{ width: 200, marginBottom: 10 }}
        />
        <span>日期范围:</span>
        <RangePicker
          onChange={([start, end]) => {
            if (start && end) {
              setStartDate(start);
              setEndDate(end);
            }
          }}
        />
        <Button
          onClick={() => {
            fetchCloseData();
          }}
        >
          提交
        </Button>
      </div>
      {Object.keys(chartData).length !== 0 ? (
        <Line
          data={chartData}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || "";
                    if (label) {
                      label += ": ";
                    }
                    label += context.parsed.y;
                    label += ` (Change %: ${context.raw.changePercent.toFixed(
                      4
                    )}%)`;
                    return label;
                  },
                },
              },
            },
          }}
        />
      ) : (
        <p>Loading chart data...</p>
      )}
    </div>
  );
}
