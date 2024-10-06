<?php

class Database
{
    private $con;

    public function __construct($con)
    {
        $this->con = $con;
    }

    public function query($sql)
    {
        return mysqli_query($this->con, $sql);
    }
}
