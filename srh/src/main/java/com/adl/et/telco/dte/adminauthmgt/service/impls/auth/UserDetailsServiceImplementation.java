package com.adl.et.telco.dte.adminauthmgt.service.impls.auth;


import com.adl.et.telco.dte.adminauthmgt.client.auth.UserDetailClient;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserBasicInfo;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserDetailsServiceImplementation implements UserDetailsService {
    @Autowired
    private UserDetailClient userDetailClient;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            CommonSouthBoundResponse<UserBasicInfo> userCredentials = userDetailClient.getBasicUserDetails(email);
            return new User(email, userCredentials.getResponseData().getEmail(), new ArrayList<>());
        } catch (Exception exp){
            throw new UsernameNotFoundException(Constants.USER_NAME_NOT_FOUND);
        }
    }
}
