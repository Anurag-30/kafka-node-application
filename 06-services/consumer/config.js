module.exports = {
  kafka_topic: process.env.KAFKA_TOPIC || "event-bus",
  kafka_server_host: process.env.KAFKA_HOST || "zookeeper-service.kafka-ca1",
  kafka_server_port: process.env.ZOOKEEPER_PORT || "2181",
};
