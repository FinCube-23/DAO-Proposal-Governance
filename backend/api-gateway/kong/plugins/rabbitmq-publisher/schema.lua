local typedefs = require "kong.db.schema.typedefs"

return {
  name = "rabbitmq-publisher",
  fields = {
    { protocols = typedefs.protocols_http },
    { config = {
        type = "record",
        fields = {
          { exchange_name = {
              type     = "string",
              required = true,
              default  = "exchange.transaction-receipt.fanout",
            }
          },
        },
      },
    },
  },
}
