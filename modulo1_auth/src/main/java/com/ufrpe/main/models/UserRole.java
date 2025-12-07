package com.ufrpe.main.models;

public enum UserRole {
    ADMIN("ADMIN"),
    PREMIUM("PREMIUM"),
    FREE("FREE");
    private String role;


    UserRole(String role){
        this.role = role;

    }
    public String getRole(){
        return role;
    }
}
