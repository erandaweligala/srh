/*
 * package com.adl.et.telco.dte.adminauthmgt.service.impls.rabbitpublisher;
 * 
 * import
 * com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity.ActionLogRequest;
 * import lombok.extern.slf4j.Slf4j;
 * import org.springframework.amqp.rabbit.core.RabbitTemplate;
 * import org.springframework.beans.factory.annotation.Value;
 * import org.springframework.stereotype.Service;
 * 
 * @Service
 * 
 * @Slf4j
 * public class RabbitMQSender {
 * 
 * private final RabbitTemplate rabbitTemplate;
 * 
 * @Value("${spring.queue.exchange.directExchange}")
 * private String exchange;
 * 
 * @Value("${spring.queue.routing.logUserActivityRoutingKey}")
 * private String logUserActivityRoutingKey;
 * 
 * 
 * 
 * public RabbitMQSender(RabbitTemplate rabbitTemplate) {
 * this.rabbitTemplate = rabbitTemplate;
 * }
 * 
 * public void send(ActionLogRequest request) { // Remove static
 * rabbitTemplate.convertAndSend(exchange, logUserActivityRoutingKey, request);
 * log.info("Sent ActionLogRequest: {}", request);
 * }
 * 
 * 
 * }
 */
