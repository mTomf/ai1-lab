create table recipe
(
    id           integer not null
        constraint recipe_pk
            primary key autoincrement,
    name           TEXT    not null,
    instruction TEXT    not null
);

