const avro = require("avsc");

const avroSchema = {
  name: "SaleType",
  type: "record",
  fields: [
    {
      name: "saleDate",
      type: {
        type: "long",
        logicalType: "timestamp-millis",
      },
    },
    {
      name: "total",
      type: "double",
    },
  ],
};

const avroSchema2 = {
  name: "MessageType",
  type: "record",
  fields: [
    {
      name: "recipient",
      type: {
        type: "string",
        logicalType: "uuid",
      },
    },
    {
      name: "message",
      type: "string",
    },
  ],
};

const saleType = avro.parse(avroSchema);
const messageType = avro.parse(avroSchema2);

module.exports = {
  saleType,
  messageType,
};
