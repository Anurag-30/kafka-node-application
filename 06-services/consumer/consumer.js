const moment = require("moment");
const uuidv4 = require("uuid/v4");
const kafka = require("kafka-node");
const type = require("./type");
const express = require("express");
const http = require("http");
const config = require("./config");
const pgClient = require("./pgClient");
const bodyParser = require("body-parser");

const PORT = process.env.APP_PORT || 8098;
const APP_VERSION = "0.8.9";
const APP_NAME = "ConsumerService";

const app = express();
const server = http.createServer(app);
server.listen(PORT, function () {
  console.log(
    `Microservice' + ${APP_NAME}  running (version ${APP_VERSION}), Express is listening... at  ${PORT}  for /ping, /about and /event-bus calls`
  );
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "*/*" }));
app.get("/", (req, res) => {
  res.json("alive");
});
app.get("/about", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("About EventBusListener, Version " + APP_VERSION);
  res.write("Supported URLs:");
  res.write("/ping (GET)\n;");
  res.write("/event-bus (GET)");
  res.write("NodeJS runtime version " + process.version);
  res.write("incoming headers" + JSON.stringify(req.headers));
  res.end();
});

app.get("/ping", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("Reply from " + APP_NAME);
  res.write("incoming headers" + JSON.stringify(req.headers));
  res.end();
});

app.get("/event-bus", function (req, res) {
  var document = { topic: config.kafka_topic, events: events };
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(document));
});

const events = [];
async function initializeKafkaConsumer(attempt) {
  try {
    await pgClient.connect();
    const Consumer = kafka.Consumer;
    console.log(
      `... trying to connect to Kafka at ${config.kafka_server_host}:${config.kafka_server_port}`
    );
    const client = new kafka.KafkaClient({
      kafkaHost: `${config.kafka_server_host}:${config.kafka_server_port}`,
    });
    let consumer = new Consumer(
      client,
      [{ topic: config.kafka_topic, partition: 0, offset: -1 }],
      {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fetchMaxBytes: 1024 * 1024,
        encoding: "utf8",
        fromOffset: false,
        groupId: "event-bus-listener",
        "auto.offset.reset": "latest",
      }
    );
    consumer.on("message", async function (message) {
      console.log("here");
      console.log("kafka-> ", message.value);
      try {
        await handleEventBusMessage(message);
      } catch (e) {
        console.log(
          `handling the message failed with error ${JSON.stringify(e)}`
        );
      }
    });
    consumer.on("error", function (err) {
      console.log("error", err);
    });
    consumer.on("connect", function () {
      console.log(
        `connected to kafkaTopic ${config.kafka_topic} at host ${config.kafka_server_host}:${kafka_server_port}`
      );
    });
  } catch (e) {
    console.log(e);
  }
} //initializeKafkaConsumer

process.once("SIGINT", function () {
  async.each([consumerGroup], function (consumer, callback) {
    consumer.close(true, callback);
  });
});

initializeKafkaConsumer(1);

async function handleEventBusMessage(eventMessage) {
  try {
    const event = JSON.parse(eventMessage.value);
    console.log("received message", eventMessage);
    console.log("received message object", JSON.stringify(eventMessage));
    console.log("actual event: " + JSON.stringify(event));
    events.push(event);
    console.log("successful");
    await pgClient.query({
      text: "INSERT INTO message(recipient_uuid, message) VALUES($1, $2)",
      values: [uuidv4(), event],
    });
  } catch (e) {
    console.error("Exception " + e + "in handling event " + eventMessage.value);
  }
} // handleEventBusMessage

// (async () => {
//   const pgClient = new PgClient();
//   await pgClient.connect();

//   const kafkaClientOptions = {
//     sessionTimeout: 100,
//     spinDelay: 100,
//     retries: 2,
//   };
//   const kafkaClient = new kafka.Client(
//     process.env.KAFKA_ZOOKEEPER_CONNECT,
//     "consumer-client",
//     kafkaClientOptions
//   );

//   const topics = [{ topic: "sales-topic" }];

//   const options = {
//     autoCommit: true,
//     fetchMaxWaitMs: 1000,
//     fetchMaxBytes: 1024 * 1024,
//     encoding: "buffer",
//   };

//   const kafkaConsumer = new kafka.HighLevelConsumer(
//     kafkaClient,
//     topics,
//     options
//   );

//   const kafkaProducer = new kafka.HighLevelProducer(kafkaClient);

//   kafkaConsumer.on("message", async function (message) {
//     console.log("Message received:", message);
//     const messageBuffer = new Buffer(message.value, "binary");

//     const decodedMessage = type.saleType.fromBuffer(messageBuffer.slice(0));
//     console.log("Decoded Message:", typeof decodedMessage, decodedMessage);

//     const saleDateISO8601 = moment(decodedMessage.saleDate).toISOString();
//     try {
//       await pgClient.query({
//         text: "INSERT INTO sales(uuid, total, sale_date) VALUES($1, $2, $3)",
//         values: ["xxxx", decodedMessage.total, saleDateISO8601],
//       });
//     } catch (err) {
//       const messageBuffer = type.messageType.toBuffer({
//         recipient: uuidv4(),
//         message: "hi=there",
//       });

//       const payload = [
//         {
//           topic: "message-topic",
//           messages: messageBuffer,
//           attributes: 1,
//         },
//       ];

//       kafkaProducer.send(payload, (err, result) => {
//         console.info("Sent payload to Kafka:", payload);
//         if (err) {
//           console.error("Sending payload failed:", err);
//         } else {
//           console.log("Sending payload result:", result);
//         }
//       });
//       console.log("err");
//     }
//   });

//   kafkaClient.on("error", (error) =>
//     console.error("Kafka client error:", error)
//   );
//   kafkaConsumer.on("error", (error) =>
//     console.error("Kafka consumer error:", error)
//   );
// })();
