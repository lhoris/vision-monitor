-- Keep one default live dashboard layout per user.

DELETE l1
FROM layouts l1
JOIN layouts l2
  ON l1.user_id = l2.user_id
 AND l1.id > l2.id;

ALTER TABLE layouts
    ADD CONSTRAINT uk_layouts_user_id UNIQUE (user_id);
