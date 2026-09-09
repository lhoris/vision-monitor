package com.vision.repository;

import com.vision.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long>, JpaSpecificationExecutor<UserAccount> {

    Optional<UserAccount> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);

    /** Transitional compatibility method; authorization counts are resolved from TB_M26_USER_AUTH. */
    default long countByRoleIgnoreCaseAndAccountStatusAndEmploymentStatus(String role, String accountStatus, String employmentStatus) {
        return 0L;
    }
}
