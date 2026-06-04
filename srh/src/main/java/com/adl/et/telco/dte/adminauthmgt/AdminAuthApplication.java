/**
 * Copyrights 2020 Axiata Digital Labs Pvt Ltd.
 * All Rights Reserved.
 *
 * These material are unpublished, proprietary, confidential source
 * code of Axiata Digital Labs Pvt Ltd (ADL) and constitute a TRADE
 * SECRET of ADL.
 *
 * ADL retains all title to and intellectual property rights in these
 * materials.
 *
 */
package com.adl.et.telco.dte.adminauthmgt;

import com.adl.et.telco.dte.plugin.pluginenabler.annotations.EnableDtePlugins;
import com.adl.et.telco.dte.prom_spring_metrics_plugin.domain.metrics.autoconfigure.PromMetricsAutoConfiguration;
import com.adl.et.telco.dte.prom_spring_metrics_plugin.domain.metrics.autoconfigure.PromMetricsJvmSystemAutoConfiguration;
import com.adl.et.telco.dte.prom_spring_metrics_plugin.domain.metrics.log.LogMetricsAutoConfiguration;
import io.prometheus.client.CollectorRegistry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.metrics.export.prometheus.PrometheusScrapeEndpoint;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Import;

import java.net.InetAddress;
import java.net.UnknownHostException;

@SpringBootApplication
@DependsOn({"dteLoggingUtils"})
//@Import({PrometheusScrapeEndpoint.class, CollectorRegistry.class})
@Import({PromMetricsAutoConfiguration.class, PromMetricsJvmSystemAutoConfiguration.class, LogMetricsAutoConfiguration.class})
@EnableDtePlugins
//Enable Annotations
public class AdminAuthApplication {

	public static void main(String[] args) {
		try {
			setHostAddress();
		} catch (UnknownHostException e) {
			e.printStackTrace();
		}
		SpringApplication.run(AdminAuthApplication.class, args);
	}
	private static void setHostAddress() throws UnknownHostException {
		InetAddress ip = InetAddress.getLocalHost();
		String hostAddress = ip.getHostAddress();
		System.setProperty("host.address",hostAddress);
	}


}
