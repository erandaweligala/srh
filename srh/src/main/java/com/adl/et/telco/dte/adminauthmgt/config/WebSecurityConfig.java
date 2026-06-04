package com.adl.et.telco.dte.adminauthmgt.config;

import com.adl.et.telco.dte.adminauthmgt.filter.JwtRequestFilter;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.UserDetailsServiceImplementation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    private final UserDetailsServiceImplementation userDetailsServiceImplementation;
    private final JwtRequestFilter jwtRequestFilter;

    @Value("${cors.allowed-origins:}")
    private String allowedOrigins;

    public WebSecurityConfig(UserDetailsServiceImplementation userDetailsServiceImplementation,
                             JwtRequestFilter jwtRequestFilter) {
        this.userDetailsServiceImplementation = userDetailsServiceImplementation;
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/srh/auth/azure-ad-auth/saml2-request").permitAll()
                        .requestMatchers("/auth/azure-ad-auth/saml-res").permitAll()
                        .requestMatchers("/srh/auth/azure-ad-auth/saml-res").permitAll()
                        .requestMatchers("/srh/auth/user/login").permitAll()
                        .requestMatchers("/srh/credential-auth/**").permitAll()
                        .requestMatchers("/internal/monitor/health").permitAll()
                        .requestMatchers("/internal/monitor/prometheus").permitAll()
                        .requestMatchers("/internal/monitor/**").denyAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/srh/user-management/user-action-log/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**", "/swagger-ui.html", "/swagger-resources/**",
                                "/webjars/**", "/v2/api-docs", "/v3/api-docs", "/v3/api-docs/**"
                        ).permitAll()
                        .requestMatchers("/api/plans/approval/pending").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(e -> e.authenticationEntryPoint(
                        (req, res, ex) -> res.sendError(401))  // optional — customize if needed
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return httpSecurity.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsServiceImplementation);
        provider.setPasswordEncoder(new BCryptPasswordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            CorsConfiguration frontendConfig = new CorsConfiguration();
            frontendConfig.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
            frontendConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
            frontendConfig.setAllowedHeaders(Arrays.asList("*"));
            frontendConfig.setAllowCredentials(true);

            CorsConfiguration samlConfig = new CorsConfiguration();
            samlConfig.addAllowedOriginPattern("*");
            samlConfig.setAllowedMethods(Arrays.asList("POST"));
            samlConfig.setAllowedHeaders(Arrays.asList("*"));

            source.registerCorsConfiguration("/srh/auth/azure-ad-auth/saml-res", samlConfig);
            source.registerCorsConfiguration("/auth/azure-ad-auth/saml-res", samlConfig);
            source.registerCorsConfiguration("/**", frontendConfig);
        }

        return source;
    }
}