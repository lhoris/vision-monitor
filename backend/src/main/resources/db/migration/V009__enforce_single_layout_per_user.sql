-- Keep one default live dashboard layout per user.

DELETE l1
FROM TB_M26_LAYOUTS l1
JOIN TB_M26_LAYOUTS l2
  ON l1.user_id = l2.user_id
 AND l1.id > l2.id;

ALTER TABLE TB_M26_LAYOUTS
    ADD CONSTRAINT uk_tb_m26_layouts_user_id UNIQUE (user_id);
