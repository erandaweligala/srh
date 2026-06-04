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
public class Actions {
    @Id
    private Long id;
    private String name;
    private String description;
    private boolean isMainAction;
    private String type;

    @ManyToMany(mappedBy = "actions", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RouteInfo> routeList;

}
