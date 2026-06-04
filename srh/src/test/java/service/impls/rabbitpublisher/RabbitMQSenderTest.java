//package service.impls.rabbitpublisher;
//
//import com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity.ActionLogRequest;
//import com.adl.et.telco.dte.adminauthmgt.service.impls.rabbitpublisher.RabbitMQSender;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.amqp.rabbit.core.RabbitTemplate;
//
//import java.lang.reflect.Field;
//
//import static org.mockito.Mockito.*;
//
//class RabbitMQSenderTest {
//
//    @Mock
//    private RabbitTemplate rabbitTemplate;
//
//    @InjectMocks
//    private RabbitMQSender rabbitMQSender;
//
//    private final String exchange = "test-exchange";
//    private final String routingKey = "test-routing-key";
//
//    @BeforeEach
//    void setUp() throws Exception {
//        MockitoAnnotations.openMocks(this);
//        rabbitMQSender = new RabbitMQSender(rabbitTemplate);
//
//        // Set private fields using reflection
//        Field exchangeField = RabbitMQSender.class.getDeclaredField("exchange");
//        exchangeField.setAccessible(true);
//        exchangeField.set(rabbitMQSender, exchange);
//
//        Field routingKeyField = RabbitMQSender.class.getDeclaredField("logUserActivityRoutingKey");
//        routingKeyField.setAccessible(true);
//        routingKeyField.set(rabbitMQSender, routingKey);
//
//    }
//
//    @Test
//    void testSend_Success() {
//        ActionLogRequest request = new ActionLogRequest();
//        request.setActivity("USER_LOGIN");
//        request.setActivityId("12345");
//
//        rabbitMQSender.send(request);
//
//        // Verify that the RabbitTemplate is used with correct parameters
//        verify(rabbitTemplate, times(1)).convertAndSend(exchange, routingKey, request);
//    }
//}
