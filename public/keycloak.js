var keycloak = Keycloak();
keycloak.init().success(function(authenticated) {
    !authenticated && keycloak.login()
}).error(function() {
    
});