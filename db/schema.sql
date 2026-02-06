
create table dw_registry(
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain varchar(128) NOT NULL,
    origin varchar(128) NOT NULL,
    registry_created_at timestamp NOT NULL,
    registry_updated_at timestamp NULL,
    registry_expires_at timestamp NOT NULL,
    --
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp NULL,
    deleted_at timestamp NULL,
    CONSTRAINT registry_pkey PRIMARY KEY (id)
);

create table dw_watcher(
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registry_id uuid NOT NULL,
    mail_address varchar(128) NOT NULL,
    notification_enabled boolean NOT NULL DEFAULT TRUE,
    --
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp NULL,
    deleted_at timestamp NULL,
    CONSTRAINT watcher_ukey UNIQUE (mail_address, registry_id),
    CONSTRAINT registry_id_fkey FOREIGN KEY (registry_id) REFERENCES dw_registry(id),
    CONSTRAINT watcher_pkey PRIMARY KEY (id)
);
