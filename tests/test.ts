import { JobEntrySubsystem } from "../index";

const connectionOptions = {
    host: "localhost",
    password: "test1",
    user: "test",
};

const jobEntrySubsystem = new JobEntrySubsystem(connectionOptions);

const JCLTestJob = `
//${connectionOptions.user}TSS  JOB 0,'${connectionOptions.user}',CLASS=P,MSGCLASS=X,
//            NOTIFY=${connectionOptions.user},MSGLEVEL=(,0)
//**
//**
//**
//**
//********************************************************************
//* QUERY TOP SECRET INFORMATION FOR USER
//        EXEC  PGM=TSSCFILE,PARM='PRINTDATA',REGION=0M
//PRINT   DD    SYSOUT=(,)
//OUT     DD    SYSOUT=X
//IN      DD    *
       TSS LIS(${connectionOptions.user}) DATA(ALL)
/*
`;

const JCLBuffer = Buffer.from(JCLTestJob.replace(/\r?\n/g, "\r\n"), "ascii");

jobEntrySubsystem.submitJob(JCLBuffer, "tsslist.jcl")
    .then( (buffer) => {
        console.log(buffer.toString("ascii"));
    } );
