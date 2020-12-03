SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `numbers` (
  `id` int(11) NOT NULL,
  `number` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `territory` int(11) DEFAULT NULL,
  `user` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `numbers_hist` (
  `id` int(11) NOT NULL,
  `number_id` int(11) DEFAULT NULL,
  `status` varchar(5) DEFAULT NULL,
  `details` varchar(1000) DEFAULT NULL,
  `changed_date` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `month` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `weeks` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `participate` tinyint(1) DEFAULT NULL,
  `gender` char(2) DEFAULT NULL,
  `hall` varchar(5) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `reading` tinyint(1) DEFAULT NULL,
  `initial_call` tinyint(1) DEFAULT NULL,
  `return_visit` tinyint(1) DEFAULT NULL,
  `study` tinyint(1) DEFAULT NULL,
  `talk` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `helper_id` int(11) DEFAULT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `hall` char(2) DEFAULT NULL,
  `task` varchar(50) DEFAULT NULL,
  `rv` int(11) DEFAULT NULL,
  `week` int(11) DEFAULT NULL,
  `month` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `territories` (
  `id` int(11) NOT NULL,
  `number` int(11) DEFAULT NULL,
  `isCompany` tinyint(1) DEFAULT 0,
  `last_worked` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `territories_hist` (
  `id` int(11) NOT NULL,
  `territory_id` int(11) DEFAULT NULL,
  `assigned` varchar(20) DEFAULT NULL,
  `date_from` datetime DEFAULT NULL,
  `date_to` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `uid` varchar(200) DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `numbers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `territory` (`territory`);

ALTER TABLE `numbers_hist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `number_id` (`number_id`);

ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `helper_id` (`helper_id`),
  ADD KEY `schedule_id` (`schedule_id`);

ALTER TABLE `territories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `number` (`number`);

ALTER TABLE `territories_hist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `territory_id` (`territory_id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `numbers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `numbers_hist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `territories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `territories_hist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

INSERT INTO `users` (`id`, `email`, `meta`) VALUES ('1', 'muller.pav@gmail.com', '{"admin":1,"lifeministry":0,"territories":0,"numbers":1}');