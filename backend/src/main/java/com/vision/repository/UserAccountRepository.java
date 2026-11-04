package com.vision.repository;

import com.vision.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long>, JpaSpecificationExecutor<UserAccount> {

    Optional<UserAccount> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    @Query(value = "SELECT u.* FROM TB_M26_USER u "
            + "JOIN TB_M26_USER_AUTH ua ON ua.USER_ID = u.USER_ID "
            + "JOIN TB_M26_AUTH a ON a.AUTH_ID = ua.AUTH_ID "
            + "WHERE u.DATA_END_STATUS = 'N' AND COALESCE(u.ACCOUNT_STATUS, 'active') = 'active' "
            + "AND ua.DATA_END_STATUS = 'N' AND a.DATA_END_STATUS = 'N' AND a.AUTH_CODE = 'ADMIN' "
            + "ORDER BY u.USER_ID LIMIT 1", nativeQuery = true)
    Optional<UserAccount> findFirstActiveAdministrator();

    /** Transitional compatibility method; authorization counts are resolved from TB_M26_USER_AUTH. */
    default long countByRoleIgnoreCaseAndAccountStatusAndEmploymentStatus(String role, String accountStatus, String employmentStatus) {
        return 0L;
    }
}
