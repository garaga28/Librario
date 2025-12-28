package com.librario.dto;

public class RegisterDto {
    private String name;
    private String email;
    private String password;
    private Long roleId;

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Long getRoleId() {
        return roleId;
    }


}
