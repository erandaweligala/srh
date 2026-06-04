package com.adl.et.telco.dte.adminauthmgt.service.saml;

import com.adl.et.telco.dte.adminauthmgt.client.auth.UserDetailClient;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.SamlUserData;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.TokenResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserBasicInfo;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.access.AuthLoggingConstants;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum;
import org.apache.commons.codec.binary.Base64;
import org.opensaml.core.config.InitializationException;
import org.opensaml.core.config.InitializationService;
import org.opensaml.core.xml.XMLObject;
import org.opensaml.core.xml.io.Unmarshaller;
import org.opensaml.core.xml.schema.XSAny;
import org.opensaml.core.xml.schema.XSString;
import org.opensaml.saml.saml2.core.Assertion;
import org.opensaml.saml.saml2.core.Attribute;
import org.opensaml.saml.saml2.core.AttributeStatement;
import org.opensaml.saml.saml2.core.Response;
import org.opensaml.security.x509.BasicX509Credential;
import org.opensaml.xmlsec.signature.Signature;
import org.opensaml.xmlsec.signature.support.SignatureException;
import org.opensaml.xmlsec.signature.support.SignatureValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.*;


@Service
public class SamlResponseService {
    private static final Logger logger = LoggerFactory.getLogger(SamlResponseService.class);
    @Autowired
    ResponseHandler handler;
    private boolean bootStrapped;
    @Value("${saml.public-key-certificate.path}")
    private String publicKeyCertificatePath;
    @Value("${temp.token.ttl.sec}")
    private Long tempTokenExpTime;
    @Value("${prefix.temp}")
    private String tempTokenPrefix;
    @Autowired
    private CommonSecurityService commonSecurityService;

    @Autowired
    private UserDetailClient userDetailClient;

    @Autowired
    private CacheRepository cacheRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ResourceLoader resourceLoader;

    public SamlResponseService() throws InitializationException {
        InitializationService.initialize();
    }

    public CommonNorthBoundResponse<TokenResponse> createTempToken(String saml) {
        try {
            logger.debug("Create temp token initiated");
            Document samlDocument = convertStringToXMLDocument(saml);
            if (samlDocument != null) {
                Element samlDocumentElement = samlDocument.getDocumentElement();
                XMLObject samlXMLObject = unmarshallSamlDocElement(samlDocumentElement);
                return getTempTokenFromSamlXmlObject(samlXMLObject);
            } else {
                logger.error("Create temp token failed | {}","SAML not available");
                return accessFailureHandler(AuthCodeEnum.INVALID_SAML_DOCUMENT);
            }
        } catch (RuntimeException | ParserConfigurationException ex) {
            logger.error("Create temp token failed | {} | {} ",ex.getMessage(),ex.getStackTrace());
            return accessFailureHandler(AuthCodeEnum.EXCEPTION_SERVICE_LAYER);
        }
    }

    private static Document convertStringToXMLDocument(String xmlString) throws ParserConfigurationException {
        //Parser that produces DOM object trees from XML content
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        //API to obtain DOM Document instance
        DocumentBuilder builder = null;
        try {
            //Create DocumentBuilder with default configuration
            builder = factory.newDocumentBuilder();
            byte[] base64DecodedResponse = Base64.decodeBase64(xmlString);
            //Parse the content to Document object
            Document doc = builder.parse(new InputSource(new StringReader(new String(base64DecodedResponse, StandardCharsets.UTF_8))));
            return doc;
        } catch (Exception e) {
            logger.error(AuthLoggingConstants.SAML_TOXML_CONVERSION_FALED, Arrays.toString(e.getStackTrace()));
        }
        return null;
    }


    private CommonNorthBoundResponse<TokenResponse> getTempTokenFromSamlXmlObject(XMLObject samlXMLObject) {
        logger.debug("getAccessTokenFromSamlXmlObject method started");
        Response samlResponse;
        if (samlXMLObject != null) {
            samlResponse = (Response) samlXMLObject;
            SamlUserData samlUserData = getSamlUserData(samlResponse);
            boolean isValidSaml = validateSaml(samlResponse);

            CommonSouthBoundResponse<UserBasicInfo> userBasicInfo = userDetailClient.getBasicUserDetails(samlUserData.getEmail());

            boolean isEligible = false;
            if (Objects.nonNull(userBasicInfo.getResponseData()))
                isEligible = commonSecurityService.isEligible(userBasicInfo);

            if (isValidSaml && Objects.nonNull(userBasicInfo.getResponseData()) && isEligible) {
                logger.debug("getAccessTokenFromSamlXmlObject method finished");
                return handler.responseBuilder(createTempTokenFromBasicUserInfo(userBasicInfo.getResponseData()), AuthCodeEnum.LOGIN_SUCCESS.description(), AuthCodeEnum.LOGIN_SUCCESS.code());

            } else if (Objects.isNull(userBasicInfo.getResponseData())) {
                return accessFailureHandler(AuthCodeEnum.USER_NOT_FOUND);
            } else if (!isEligible) {
                return accessFailureHandler(AuthCodeEnum.INACTIVE_USER);
            } else {
                return accessFailureHandler(AuthCodeEnum.INVALID_SAML_RESPONSE);
            }
        } else {
            return accessFailureHandler(AuthCodeEnum.INVALID_SAML_OBJECT);
        }
    }

    private SamlUserData getSamlUserData(Response samlResponse) throws BaseException {
        try {
            SamlUserData samlUserData = new SamlUserData();
            Assertion assertion = samlResponse.getAssertions().get(0);

            // Extract Request ID from SubjectConfirmation
            samlUserData.setRequestId(assertion.getSubject().getSubjectConfirmations().get(0)
                    .getSubjectConfirmationData().getInResponseTo());

            // Extract email from AttributeStatement instead of NameID
            String email = null;
            for (AttributeStatement attributeStatement : assertion.getAttributeStatements()) {
                for (Attribute attribute : attributeStatement.getAttributes()) {
                    // Look for the name claim which contains the email
                    if ("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name".equals(attribute.getName())) {
                        if (!attribute.getAttributeValues().isEmpty()) {
                            XMLObject xmlObject = attribute.getAttributeValues().get(0);
                            if (xmlObject instanceof XSString) {
                                email = ((XSString) xmlObject).getValue();
                            } else if (xmlObject instanceof XSAny) {
                                email = ((XSAny) xmlObject).getTextContent();
                            }
                        }
                        break;
                    }
                }
                if (email != null) break;
            }

            if (email == null || email.isEmpty()) {
                throw new BaseException("Email not found in SAML assertion",
                        ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(),
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(),
                        new StackTraceElement[0]);
            }

            samlUserData.setEmail(email);

            // Log for debugging
            logger.info("Extracted email from SAML: {}", email);

            return samlUserData;
        } catch (Exception e) {
            logger.error(AuthLoggingConstants.SAML_USER_DATA_EXTRACTION_FAILED, Arrays.toString(e.getStackTrace()));
            throw new BaseException(e.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(),
                    HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), e.getStackTrace());
        }
    }

    private boolean validateSaml(Response samlResponse) throws BaseException {
        logger.debug("validateSaml method started");
        boolean isValidSaml = false;
        try {
            Assertion assertion = samlResponse.getAssertions().get(0);
            Signature samlSignature = assertion.getSignature();
            //Get Public Key
            Resource resource = resourceLoader.getResource("classpath:"+publicKeyCertificatePath);
            if (resource.exists()) {
                CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
                InputStream fileStream = resource.getInputStream();
                X509Certificate certificate = (X509Certificate) certificateFactory.generateCertificate(fileStream);
                BasicX509Credential publicCredential = new BasicX509Credential(certificate);
                fileStream.close();

                X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(certificate.getPublicKey().getEncoded());
                KeyFactory keyFactory = KeyFactory.getInstance("RSA");
                PublicKey key = keyFactory.generatePublic(publicKeySpec);

                //Validate Public Key against Signature
                if (key != null) {
                    publicCredential.setEntityCertificate(certificate);
                    SignatureValidator.validate(samlSignature, publicCredential);
                    isValidSaml = true;
                }
                logger.debug("validateSaml method finished");
                return isValidSaml;
            }
        } catch (IOException ex) {
            logger.error(AuthLoggingConstants.SAML_VALIDATION_FAILED, Arrays.toString(ex.getStackTrace()));
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        } catch (RuntimeException e) {
            logger.error(AuthLoggingConstants.SAML_VALIDATION_FAILED, Arrays.toString(e.getStackTrace()));
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            logger.error(AuthLoggingConstants.SAML_VALIDATION_FAILED, Arrays.toString(e.getStackTrace()));
            throw new RuntimeException(e);
        } catch (InvalidKeySpecException e) {
            logger.error(AuthLoggingConstants.SAML_VALIDATION_FAILED, Arrays.toString(e.getStackTrace()));
            throw new RuntimeException(e);
        } catch (SignatureException | CertificateException e) {
            logger.error(AuthLoggingConstants.SAML_VALIDATION_FAILED, Arrays.toString(e.getStackTrace()));
            throw new RuntimeException(e);
        }
        return false;
    }


    private TokenResponse createTempTokenFromBasicUserInfo(UserBasicInfo basicInfo) throws BaseException {
        logger.debug("accessTokenSamlProcessor method started");
        String requestVerificationToken = generateRVT();
        Map<String, String> tempTokenMap = createTempToken(basicInfo);
        logger.debug("handleTokens method started");
        TokenResponse tokenResponse = new TokenResponse();
        String tempToken = tempTokenMap.get(ServiceConstants.TOKEN);
        String rvtoken = requestVerificationToken;
        tokenResponse.setTempToken(tempToken);
        tokenResponse.setRequestVerificationToken(rvtoken);

        // Save rv token and user id in redis as temp token
        cacheRepository.save(tempTokenPrefix + basicInfo.getUsername(), rvtoken, tempTokenExpTime);

        logger.debug("handleTokens method finished");
        return tokenResponse;
    }

    private String generateRVT() {
        UUID uuid = UUID.randomUUID();
        return String.valueOf(uuid);
    }

    private XMLObject unmarshallSamlDocElement(Element samlDocumentElement) throws BaseException {
        logger.debug("unmarshallSamlDocElement method started");
        try {

            Unmarshaller unmarshaller = org.opensaml.core.xml.util.XMLObjectSupport.getUnmarshaller(samlDocumentElement);
            org.opensaml.core.xml.XMLObject unmarshall = unmarshaller.unmarshall(samlDocumentElement);
            logger.debug("unmarshallSamlDocElement method finished");
            return unmarshall;
        } catch (Exception ex) {
            logger.error(AuthLoggingConstants.SAML_UNMARSHAL_FAILED, Arrays.toString(ex.getStackTrace()));
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }

    private Map<String, String> createTempToken(UserBasicInfo userBasicInfo) throws BaseException {
        logger.debug("createTempToken method started");
        try {
            Map<String, String> tempTokenMap = new HashMap<>();
            Map<String, Object> claimsMap = new HashMap<>();
            claimsMap.put(ServiceConstants.EMAIL, userBasicInfo.getEmail());
            jwtService.generateAccessToken(userBasicInfo.getUsername(), claimsMap, tempTokenMap);
            logger.debug("createTempToken method finished");
            return tempTokenMap;
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }

    private CommonNorthBoundResponse<TokenResponse> accessFailureHandler(AuthCodeEnum respCodeEnum) {
        return handler.northBoundRespHandler(respCodeEnum.code(), respCodeEnum.description());
    }


}




