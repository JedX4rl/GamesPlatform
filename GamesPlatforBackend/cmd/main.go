package main

import (
	"GamesPlatforBackend/internal/configs/serverConfig"
	"GamesPlatforBackend/internal/configs/storageConfig"
	"GamesPlatforBackend/internal/handler"
	"GamesPlatforBackend/internal/postgres"
	"GamesPlatforBackend/internal/repository"
	"GamesPlatforBackend/internal/service"
	"context"
	"github.com/joho/godotenv"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

func main() {

	serverCfg := serverConfig.MustLoadServerConfig()
	storageCfg := storageConfig.MustLoadStorageConfig()

	dataBase, err := postgres.NewPostgresDb(storageCfg)

	if err != nil {
		slog.Error("failed to connect to database")
		os.Exit(1)
	}

	slog.Info("connected to database")

	defer func() {
		err = dataBase.Close()
		if err != nil {
			slog.Error("got error when closing the DB connection")
			os.Exit(1)
		}
	}()

	repos := repository.NewRepository(dataBase)

	services := service.NewService(repos)

	handlers := handler.NewHandler(services)

	server := &http.Server{
		Addr:    serverCfg.Address,
		Handler: handlers.InitRoutes(),
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error: %v", err)
			os.Exit(1)
		}
	}()

	<-stop

	slog.Info("shutting down gracefully...")

	ctx, cancel = context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("server shutdown error: %v", err)
		os.Exit(1)
	}

	slog.Info("server exited properly")

}
