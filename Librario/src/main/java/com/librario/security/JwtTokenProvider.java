/*package com.librario.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${security.jwt.secret-key}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpirationInMs;

    // Generate a JWT token
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationInMs);

        String token = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(expireDate)
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
        return token;
    }

    private Key key(){
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // Get username from the token
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(key())
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // Validate JWT token
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(key())
                    .parseClaimsJws(token);
            return true;
        } catch (MalformedJwtException ex) {
            // Invalid JWT token
            throw new MalformedJwtException("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            // Expired JWT token
            throw new ExpiredJwtException(null, null, "Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            // Unsupported JWT token
            throw new UnsupportedJwtException("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            // JWT claims string is empty
            throw new IllegalArgumentException("JWT claims string is empty");
        }
    }
}
*/