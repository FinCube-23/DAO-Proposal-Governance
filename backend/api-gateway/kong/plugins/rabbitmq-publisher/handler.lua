local cjson = require "cjson.safe"
local http = require "resty.http"

local function safestr(x)
  if x == nil then return "nil" end
  local t = type(x)
  if t == "string" or t == "number" or t == "boolean" then
    return tostring(x)
  end
  return (cjson and cjson.encode(x)) or ("<"..t..">")
end

-- Create exchange if it doesn't exist
local function ensure_exchange_exists(exchange_name)
  local httpc = http.new()
  httpc:set_timeout(5000)
  
  -- Check if exchange exists
  local check_url = "http://rabbitmq:15672/api/exchanges/%2F/" .. exchange_name
  local res, err = httpc:request_uri(check_url, {
    method = "GET",
    headers = {
      ["Authorization"] = "Basic " .. ngx.encode_base64("guest:guest")
    }
  })
  
  if res and res.status == 200 then
    kong.log.info("Exchange " .. exchange_name .. " already exists")
    return true
  end
  
  -- Exchange doesn't exist, create it
  kong.log.info("Creating exchange: " .. exchange_name)
  local create_url = "http://rabbitmq:15672/api/exchanges/%2F/" .. exchange_name
  local exchange_config = {
    type = "fanout",
    durable = true,
    auto_delete = false,
    internal = false
  }
  
  res, err = httpc:request_uri(create_url, {
    method = "PUT",
    headers = {
      ["Content-Type"] = "application/json",
      ["Authorization"] = "Basic " .. ngx.encode_base64("guest:guest")
    },
    body = cjson.encode(exchange_config)
  })
  
  if not res then
    kong.log.err("Failed to create exchange: " .. safestr(err))
    return false
  end
  
  if res.status == 201 or res.status == 204 then
    kong.log.info("Successfully created exchange: " .. exchange_name)
    return true
  else
    kong.log.err("Failed to create exchange: " .. res.status .. " - " .. safestr(res.body))
    return false
  end
end

-- Publish to RabbitMQ using HTTP API (more reliable than AMQP library)
local function publish_to_rabbitmq(exchange_name, message)
  -- Ensure exchange exists first
  if not ensure_exchange_exists(exchange_name) then
    return nil, "Failed to ensure exchange exists"
  end
  
  local httpc = http.new()
  httpc:set_timeout(5000) -- 5 second timeout
  
  -- RabbitMQ Management API endpoint
  local url = "http://rabbitmq:15672/api/exchanges/%2F/" .. exchange_name .. "/publish"
  
  local payload = {
    properties = {
      content_type = "application/json",
      delivery_mode = 2
    },
    routing_key = "",
    payload = message,
    payload_encoding = "string"
  }
  
  local res, err = httpc:request_uri(url, {
    method = "POST",
    headers = {
      ["Content-Type"] = "application/json",
      ["Authorization"] = "Basic " .. ngx.encode_base64("guest:guest")
    },
    body = cjson.encode(payload)
  })
  
  if not res then
    kong.log.err("HTTP request failed: " .. safestr(err))
    return nil, err
  end
  
  if res.status ~= 200 then
    kong.log.err("RabbitMQ API error: " .. res.status .. " - " .. safestr(res.body))
    return nil, "HTTP " .. res.status
  end
  
  return true
end

local RabbitmqPublisher = {
  PRIORITY = 1000,
  VERSION  = "1.0.0",
}

function RabbitmqPublisher:access(conf)
  -- Only process POST, PATCH, and PUT requests
  local method = kong.request.get_method()
  if method ~= "POST" and method ~= "PATCH" and method ~= "PUT" then
    kong.log.info("Skipping " .. method .. " request - only processing POST/PATCH/PUT")
    return
  end

  kong.log.info(">>>> ENTERED RABBITMQ PUBLISHER PLUGIN <<<<")
  kong.log.info("Request Method: " .. method)
  kong.log.info("Request Path: " .. kong.request.get_path())
  kong.log.info("Request Headers: " .. safestr(kong.request.get_headers()))

  -- Read JSON body
  local body, berr = kong.request.get_body()
  if not body or type(body) ~= "table" then
    kong.log.err("Request body missing or not a table: " .. safestr(berr or type(body)))
    return
  end

  -- Log the complete request body for debugging
  kong.log.info("Request Body Type: " .. type(body))
  kong.log.info("Request Body Keys: " .. safestr(body))
  kong.log.info("Full Request Body: " .. safestr(cjson.encode(body)))

  if body.onChainData == nil then
    kong.log.info("Request body missing 'onChainData' field - skipping RabbitMQ publish")
    return
  end

  -- Validate required onChainData fields
  local onChainData = body.onChainData
  if type(onChainData) ~= "table" then
    kong.log.err("onChainData must be an object")
    return
  end

  local required_fields = {"transactionHash", "signedBy", "signedWith", "chainId", "context"}
  for _, field in ipairs(required_fields) do
    if onChainData[field] == nil then
      kong.log.err("onChainData missing required field: " .. field)
      return
    end
  end

  -- Create detailed message with onChainData information
  local dto_info = {
    timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
    method = method,
    path = kong.request.get_path(),
    onChainData = onChainData,
    full_dto = body
  }

  local message = cjson.encode(dto_info)
  kong.log.info("OnChainData Analysis:")
  kong.log.info("  - Transaction Hash: " .. safestr(onChainData.transactionHash))
  kong.log.info("  - Signed By: " .. safestr(onChainData.signedBy))
  kong.log.info("  - Signed With: " .. safestr(onChainData.signedWith))
  kong.log.info("  - Chain ID: " .. safestr(onChainData.chainId))
  kong.log.info("  - Context: " .. safestr(onChainData.context))
  kong.log.info("  - Full Message to Publish: " .. safestr(message))

  local ok, err = publish_to_rabbitmq(conf.exchange_name, message)
  if not ok then
    kong.log.err("Failed to publish message to RabbitMQ: " .. safestr(err))
  else
    kong.log.info("Successfully published DTO to exchange: " .. safestr(conf.exchange_name))
    kong.log.info("Published message size: " .. string.len(message) .. " bytes")
  end

  kong.response.set_header("X-RabbitMQ-Publisher", "Message processed")
  kong.response.set_header("X-DTO-Type", type(body))
  kong.response.set_header("X-OnChainData-Found", "true")
end

return RabbitmqPublisher

