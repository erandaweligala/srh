package com.adl.et.telco.dte.adminauthmgt.repository.route;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RouteInfo {
    @Id
    private Long id;
    @Lob
    @Column(unique = true)
    private String inPath;
    @Lob
    private String outURL;
    private Boolean isPathVariableAvailable;

    private Long actionIds;

    @ManyToMany(cascade=CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(
            name = "route_to_actions",
            joinColumns = @JoinColumn(name = "route_id"),
            inverseJoinColumns = @JoinColumn(name = "action_id"))
    private List<Actions> actions;
}
