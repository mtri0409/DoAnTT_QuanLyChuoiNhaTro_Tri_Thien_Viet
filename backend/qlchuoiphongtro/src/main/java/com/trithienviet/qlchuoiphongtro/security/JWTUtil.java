package com.trithienviet.qlchuoiphongtro.security;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

@Component
public class JWTUtil {
    @Value("${jwt_secret}")
    private String secret;
    
    public String generateToken(String username) 
        throws IllegalAccessException, JWTCreationException {
            return JWT.create()
                      .withSubject("User Details")
                      .withClaim("username", username)
                      .withIssuedAt(new Date())
                      .withExpiresAt(new Date(System.currentTimeMillis() + 3600000))
                      .withIssuer("Event Scheduler")
                      .sign(Algorithm.HMAC256(secret));
        }
    public String validateTokenAndRetrieveSubject(String token)
        throws JWTVerificationException {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secret))
                                      .withSubject("User Details")
                                      .withIssuer("Event Scheduler")
                                      .build();
            DecodedJWT jwt = verifier.verify(token);
            return jwt.getClaim("username").asString();
        }
}
