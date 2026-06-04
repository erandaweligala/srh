package com.adl.et.telco.dte.adminauthmgt.specification;

import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.FilterValue;
import com.adl.et.telco.dte.adminauthmgt.repository.audit.ActionLog;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ActionLogSpecification {

    public static Specification<ActionLog> getSpecification(List<FilterValue> filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filters != null) {
                for (FilterValue filter : filters) {
                    String column = filter.getColumnName();
                    String op = filter.getOperation().toUpperCase();
                    String[] values = filter.getValue();

                    if ("EQUALS".equals(op) && values.length > 0) {
                        predicates.add(cb.equal(root.get(column), values[0]));
                    } else if ("LIKE".equals(op) && values.length > 0) {
                        predicates.add(cb.like(root.get(column), "%" + values[0] + "%"));
                    } else if ("IN".equals(op) && values.length > 0) {
                        predicates.add(root.get(column).in((Object[]) values));
                    } else if ("BETWEEN".equals(op) && values.length == 2 && "createdAt".equals(column)) {
                        LocalDateTime startDT = LocalDateTime.parse(values[0].replace(" ", "T"));
                        LocalDateTime endDT   = LocalDateTime.parse(values[1].replace(" ", "T"));
                        predicates.add(cb.between(root.get(column), startDT, endDT));
                    }
                    // replace with op send from FE
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
